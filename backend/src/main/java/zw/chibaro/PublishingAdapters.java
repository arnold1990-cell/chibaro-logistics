package zw.chibaro;
import java.util.*;import org.springframework.context.annotation.*;
/** Fail-closed adapter registrations. Official API transports and OAuth verification are pending. */
@Configuration
public class PublishingAdapters {
 @Bean List<PublishingAdapter> registeredPublishingAdapters(){return List.of(disabled("FACEBOOK"),disabled("INSTAGRAM"),disabled("LINKEDIN"),disabled("TIKTOK"));}
 static PublishingAdapter disabled(String name){return new PublishingAdapter(){public String provider(){return name;}public boolean eligible(Map<String,Object> post,Map<String,Object> account){return false;}public Result publish(Map<String,Object> post,Map<String,Object> account,String key){return Result.setupRequired();}};}
}
