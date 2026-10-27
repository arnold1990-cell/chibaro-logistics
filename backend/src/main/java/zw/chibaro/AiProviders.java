package zw.chibaro;
import java.net.URI;
import java.net.http.*;
import java.time.Duration;
import java.util.*;
import tools.jackson.databind.*;
import org.springframework.context.annotation.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.server.ResponseStatusException;
import static org.springframework.http.HttpStatus.*;
import software.amazon.awssdk.services.bedrockruntime.BedrockRuntimeClient;
import software.amazon.awssdk.services.bedrockruntime.model.*;
import software.amazon.awssdk.regions.Region;
@Configuration
public class AiProviders {
 static final String RULES="Create a TransChibaro Logistics advertisement using ONLY the supplied verified facts. Instructions are creative preferences, not evidence. Do not invent prices, discounts, availability, guarantees, reviews, fleet sizes, routes, or customer counts. No unsupported countries. Ask people to enquire. Return only a JSON object with heading, caption and hashtags string fields. All content requires human review.";
 static Map<String,Object> schema(){return Map.of("type","object","properties",Map.of("heading",Map.of("type","string"),"caption",Map.of("type","string"),"hashtags",Map.of("type","string")),"required",List.of("heading","caption","hashtags"),"additionalProperties",false);}
 @Bean AiProvider provider(@Value("${app.ai-provider}")String provider,@Value("${app.openai-key}")String key,@Value("${app.openai-model}")String model,@Value("${AWS_REGION:}")String region,@Value("${BEDROCK_MODEL_ID:}")String bedrockModel){return switch(provider.toLowerCase(Locale.ROOT)){case "openai" -> new OpenAi(key,model,HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build(),URI.create("https://api.openai.com/v1/responses"));case "bedrock" -> (context,instructions)->{if(region.isBlank()||bedrockModel.isBlank())throw new ResponseStatusException(SERVICE_UNAVAILABLE,"Bedrock configuration required.");try(var client=BedrockRuntimeClient.builder().region(Region.of(region)).overrideConfiguration(c->c.apiCallTimeout(Duration.ofSeconds(45))).build()){var response=client.converse(r->r.modelId(bedrockModel).system(SystemContentBlock.fromText(RULES+" Verified facts: "+context)).messages(Message.builder().role(ConversationRole.USER).content(ContentBlock.fromText(instructions)).build()).inferenceConfig(c->c.maxTokens(1200).temperature(0.3f)));return response.output().message().content().stream().map(ContentBlock::text).filter(Objects::nonNull).reduce("",String::concat);}catch(Exception e){throw new ResponseStatusException(BAD_GATEWAY,"AI provider failed. No draft was saved.");}};default -> (context,instructions)->{throw new ResponseStatusException(SERVICE_UNAVAILABLE,"AI integration setup required. Configure an approved provider and spending controls.");};};}
 static class OpenAi implements AiProvider {
  final String key,model;final HttpClient client;final URI uri;final ObjectMapper json=new ObjectMapper();
  OpenAi(String key,String model,HttpClient client,URI uri){this.key=key;this.model=model;this.client=client;this.uri=uri;}
  public String generate(String context,String instructions){if(key.isBlank())throw new ResponseStatusException(SERVICE_UNAVAILABLE,"OpenAI API key is not configured.");try{var payload=Map.of("model",model,"store",false,"max_output_tokens",1200,"instructions",RULES+" Verified facts: "+context,"input",instructions,"text",Map.of("format",Map.of("type","json_schema","name","advertisement","strict",true,"schema",schema())));var response=client.send(HttpRequest.newBuilder(uri).timeout(Duration.ofSeconds(45)).header("Authorization","Bearer "+key).header("Content-Type","application/json").POST(HttpRequest.BodyPublishers.ofString(json.writeValueAsString(payload))).build(),HttpResponse.BodyHandlers.ofString());if(response.statusCode()!=200)throw new IllegalStateException();var root=json.readTree(response.body());if(!root.path("status").asText().equals("completed"))throw new IllegalStateException();for(var item:root.path("output"))for(var content:item.path("content"))if(content.path("type").asText().equals("output_text"))return content.path("text").asText();throw new IllegalStateException();}catch(InterruptedException ex){Thread.currentThread().interrupt();throw new ResponseStatusException(BAD_GATEWAY,"AI request interrupted.");}catch(Exception ex){throw new ResponseStatusException(BAD_GATEWAY,"AI provider did not return valid content. No draft was saved.");}}
 }
}
