package zw.chibaro;
import java.util.*;import java.security.Principal;import jakarta.validation.Valid;import org.springframework.web.bind.annotation.*;import org.springframework.jdbc.core.JdbcTemplate;import org.springframework.web.server.ResponseStatusException;import static org.springframework.http.HttpStatus.*;
@RestController @RequestMapping("/api/v1/admin")
public class MarketingController {
 final JdbcTemplate db;final MarketingService service;
 public MarketingController(JdbcTemplate db,MarketingService service){this.db=db;this.service=service;}
 @GetMapping("/marketing/posts") Object posts(){return db.queryForList("select * from marketing_posts order by created_at desc limit 200");}
 @PostMapping("/marketing/posts") Object save(@Valid @RequestBody MarketingService.Draft draft,Principal actor){return service.save(draft,null,actor.getName());}
 @PatchMapping("/marketing/posts/{id}") Object edit(@PathVariable UUID id,@Valid @RequestBody MarketingService.Draft draft,Principal actor){return service.save(draft,id,actor.getName());}
 @PostMapping("/marketing/posts/{id}/approve") Object approve(@PathVariable UUID id,Principal p){service.approve(id,p.getName());return Map.of("ok",true);}
 @PostMapping("/marketing/posts/{id}/schedule") Object schedule(@PathVariable UUID id,@Valid @RequestBody MarketingService.Schedule r,Principal p){service.schedule(id,r,p.getName());return Map.of("ok",true);}
 @PostMapping("/ai/content/generate") Object generate(@Valid @RequestBody MarketingService.Generate r,Principal p){return service.generate(r,p.getName());}
 @GetMapping("/campaigns") Object campaigns(){return db.queryForList("select * from marketing_campaigns order by created_at desc limit 200");}
 @PostMapping("/campaigns") Object campaign(@Valid @RequestBody MarketingService.Campaign r,Principal p){UUID id=UUID.randomUUID();db.update("insert into marketing_campaigns(id,name,instructions) values (?,?,?)",id,r.name(),r.instructions());SecurityConfig.audit(db,p.getName(),"CAMPAIGN_CREATED",id.toString());return Map.of("id",id);}
 @PostMapping("/campaigns/{id}/approve") Object approveCampaign(@PathVariable UUID id,Principal p){if(db.update("update marketing_campaigns set approved=true where id=?",id)==0)throw new ResponseStatusException(NOT_FOUND);SecurityConfig.audit(db,p.getName(),"CAMPAIGN_APPROVED",id.toString());return Map.of("ok",true);}
 @GetMapping("/social/accounts") Object accounts(){return Map.of("accounts",db.queryForList("select id,provider,display_name,status,token_expires_at from social_accounts"),"status","Integration setup required","directPublishingEnabled",false);}
 @PostMapping("/social/connect/{provider}") Object connect(@PathVariable String provider){throw new ResponseStatusException(SERVICE_UNAVAILABLE,"Integration setup required. OAuth onboarding is not yet enabled for "+provider+".");}
 @GetMapping("/publishing/jobs") Object jobs(){return db.queryForList("select id,post_id,status,attempts,run_at,last_error from publishing_jobs order by run_at desc limit 200");}
 @GetMapping("/ai/usage") Object usage(){return Map.of("provider",service.provider,"monthlyLimit",service.limit,"used",db.queryForObject("select count(*) from ai_usage_records where created_at>=date_trunc('month',now())",Long.class));}
}
