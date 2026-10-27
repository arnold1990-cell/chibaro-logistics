package zw.chibaro;
import java.util.*;
import java.math.BigDecimal;
import java.time.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import static org.springframework.http.HttpStatus.*;
@Service
public class Operations {
 final JdbcTemplate db;
 public Operations(JdbcTemplate db){this.db=db;}
 static String reference(String prefix){return prefix+"-"+UUID.randomUUID().toString().replace("-","").substring(0,16).toUpperCase(Locale.ROOT);}
 UUID customer(String name,String phone,String email){String normalized=phone.replaceAll("[^+0-9]","");db.queryForObject("select pg_advisory_xact_lock(hashtext(?))",Object.class,normalized);var existing=db.queryForList("select id from customers where phone=?",normalized);if(!existing.isEmpty())return (UUID)existing.getFirst().get("id");UUID id=UUID.randomUUID();db.update("insert into customers(id,name,phone,email) values (?,?,?,?)",id,name,normalized,email);return id;}
 @Transactional public Map<String,Object> submit(Contracts.Request r,boolean booking){
  String table=booking?"bookings":"quotation_requests";
  db.queryForObject("select pg_advisory_xact_lock(hashtext(?))",Object.class,r.submissionKey().toString());
  var old=db.queryForList("select reference,status,review_required from "+table+" where submission_key=?",r.submissionKey());if(!old.isEmpty())return old.getFirst();
  if(db.queryForObject("select count(*) from business_services where id=? and active",Integer.class,r.serviceId())==0)throw new ResponseStatusException(BAD_REQUEST,"Select an active service.");
  UUID customer=customer(r.fullName(),r.phone(),r.email()),id=UUID.randomUUID();String reference=reference(booking?"BK":"QT");
  Integer capacity=db.queryForObject("select coalesce(max(capacity_kg),0) from vehicles where active",Integer.class);boolean review=r.weightKg().compareTo(BigDecimal.valueOf(capacity))>0;
  db.update("insert into "+table+"(id,reference,submission_key,customer_id,service_id,pickup,destination,goods,weight_kg,preferred_date,preferred_time,rate_type,instructions,review_required) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",id,reference,r.submissionKey(),customer,r.serviceId(),r.pickup(),r.destination(),r.goods(),r.weightKg(),r.preferredDate(),r.preferredTime(),r.rateType(),r.instructions(),review);
  db.update("insert into leads(id,reference,customer_id,"+(booking?"booking_id":"quote_id")+",source,message) values (?,?,?,?,?,?)",UUID.randomUUID(),reference("LD"),customer,id,booking?"BOOKING":"QUOTE",r.goods());
  notify("NEW_"+(booking?"BOOKING":"QUOTE"),id,null);SecurityConfig.audit(db,"public","REQUEST_CREATED",id.toString());
  return Map.of("reference",reference,"status",booking?"REQUESTED":"NEW","review_required",review);
 }
 void notify(String kind,UUID id,String recipient){db.update("insert into notification_outbox(id,kind,resource_id,recipient) values (?,?,?,?)",UUID.randomUUID(),kind,id,recipient);}
 @Transactional public void contact(Contracts.Contact r){UUID customer=customer(r.fullName(),r.phone(),r.email());if(db.queryForObject("select count(*) from leads where customer_id=? and message=? and created_at>now()-interval '10 minutes'",Integer.class,customer,r.message())>0)return;UUID id=UUID.randomUUID();db.update("insert into leads(id,reference,customer_id,source,message) values (?,?,?,'CONTACT',?)",id,reference("LD"),customer,r.message());notify("NEW_LEAD",id,null);}
 static void transition(String old,String next,Map<String,Set<String>> rules){if(!old.equals(next)&&!rules.getOrDefault(old,Set.of()).contains(next))throw new ResponseStatusException(CONFLICT,"This status transition is not allowed.");}
 static final Map<String,Set<String>> QUOTES=Map.of("NEW",Set.of("UNDER_REVIEW","CANCELLED","REJECTED"),"UNDER_REVIEW",Set.of("QUOTED","REJECTED","CANCELLED"),"QUOTED",Set.of("ACCEPTED","REJECTED","EXPIRED","CANCELLED","UNDER_REVIEW"));
 static final Map<String,Set<String>> BOOKINGS=Map.of("REQUESTED",Set.of("PENDING_CONFIRMATION","CANCELLED"),"PENDING_CONFIRMATION",Set.of("CONFIRMED","CANCELLED"),"CONFIRMED",Set.of("SCHEDULED","CANCELLED"),"SCHEDULED",Set.of("IN_PROGRESS","CANCELLED"),"IN_PROGRESS",Set.of("COMPLETED","CANCELLED"));
 Map<String,Object> required(String table,UUID id){var rows=db.queryForList("select * from "+table+" where id=? for update",id);if(rows.isEmpty())throw new ResponseStatusException(NOT_FOUND,"Record not found.");return rows.getFirst();}
 @Transactional public void quote(UUID id,Contracts.QuoteUpdate r,String actor){var old=required("quotation_requests",id);transition((String)old.get("status"),r.status(),QUOTES);if(Set.of("QUOTED","ACCEPTED").contains(r.status())&&(r.price()==null||r.currency()==null||r.conditions()==null||r.conditions().isBlank()))throw new ResponseStatusException(BAD_REQUEST,"Price, currency and quotation conditions are required.");db.update("update quotation_requests set status=?,price=?,currency=?,conditions=?,updated_at=now() where id=?",r.status(),r.price(),r.currency(),r.conditions(),id);SecurityConfig.audit(db,actor,"QUOTE_"+r.status(),id.toString());}
 @Transactional public Map<String,Object> convert(UUID id,String actor){var q=required("quotation_requests",id);if(!q.get("status").equals("ACCEPTED"))throw new ResponseStatusException(CONFLICT,"Only accepted quotations can become bookings.");var old=db.queryForList("select reference from bookings where quote_id=?",id);if(!old.isEmpty())return old.getFirst();UUID bid=UUID.randomUUID();String ref=reference("BK");db.update("insert into bookings(id,reference,submission_key,quote_id,customer_id,service_id,pickup,destination,goods,weight_kg,preferred_date,preferred_time,rate_type,instructions,review_required) select ?,?,?,id,customer_id,service_id,pickup,destination,goods,weight_kg,preferred_date,preferred_time,rate_type,instructions,review_required from quotation_requests where id=?",bid,ref,UUID.randomUUID(),id);db.update("update leads set status='CONVERTED',updated_at=now() where quote_id=?",id);SecurityConfig.audit(db,actor,"QUOTE_CONVERTED",id.toString());return Map.of("reference",ref);}
 @Transactional public void booking(UUID id,Contracts.BookingUpdate r,String actor){var old=required("bookings",id);transition((String)old.get("status"),r.status(),BOOKINGS);if(Set.of("CONFIRMED","SCHEDULED","IN_PROGRESS").contains(r.status())){if(r.vehicleId()==null)throw new ResponseStatusException(BAD_REQUEST,"Assign a vehicle before confirming transport.");var capacity=db.queryForList("select capacity_kg from vehicles where id=? and active",r.vehicleId());if(capacity.isEmpty()||new BigDecimal(capacity.getFirst().get("capacity_kg").toString()).compareTo((BigDecimal)old.get("weight_kg"))<0)throw new ResponseStatusException(CONFLICT,"The load exceeds the assigned vehicle carrying limit.");}
 db.update("update bookings set status=?,vehicle_id=?,driver_name=?,updated_at=now() where id=?",r.status(),r.vehicleId(),r.driverName(),id);SecurityConfig.audit(db,actor,"BOOKING_"+r.status(),id.toString());}
 @Transactional public void lead(UUID id,Contracts.LeadUpdate r,String actor){required("leads",id);db.update("update leads set status=?,notes=?,follow_up=?,assigned_to=?,updated_at=now() where id=?",r.status(),r.notes(),r.followUp(),r.assignedTo(),id);db.update("insert into lead_activities(id,lead_id,actor,detail) values (?,?,?,?)",UUID.randomUUID(),id,actor,"Status: "+r.status());SecurityConfig.audit(db,actor,"LEAD_UPDATED",id.toString());}
}
