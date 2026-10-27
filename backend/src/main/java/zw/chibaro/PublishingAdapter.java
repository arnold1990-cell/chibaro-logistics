package zw.chibaro;
import java.time.Duration;import java.util.Map;
/** A provider must check scopes and media eligibility before performing a network write. */
public interface PublishingAdapter {
 String provider();
 boolean eligible(Map<String,Object> post,Map<String,Object> account);
 Result publish(Map<String,Object> post,Map<String,Object> account,String idempotencyKey);
 enum Outcome { SUCCESS, RETRY_SAFE, PERMANENT_FAILURE, UNKNOWN }
 record Result(Outcome outcome,String platformId,String safeError,Duration retryAfter) {
  public static Result setupRequired(){return new Result(Outcome.PERMANENT_FAILURE,null,"Integration setup required",null);}
 }
}
