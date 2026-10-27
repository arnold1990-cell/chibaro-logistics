package zw.chibaro;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
    "spring.datasource.url=${TEST_DATABASE_URL:jdbc:postgresql://localhost:55433/chibaro_test}",
    "spring.session.redis.namespace=chibaro:test:probes:sessions",
    "app.bootstrap-email=", "app.bootstrap-password=", "PUBLISHING_ENABLED=false",
    "management.endpoint.health.probes.enabled=true"
})
class HealthProbeSecurityTest {
    @Value("${local.server.port}") int port;

    @Test void anonymousHealthSubpathsExposeStatusOnly() throws Exception {
        var client = HttpClient.newHttpClient();
        for (String probe : new String[]{"liveness", "readiness"}) {
            var response = client.send(HttpRequest.newBuilder(
                URI.create("http://localhost:" + port + "/actuator/health/" + probe)).GET().build(),
                HttpResponse.BodyHandlers.ofString());
            assertEquals(200, response.statusCode(), probe);
            assertEquals("{\"status\":\"UP\"}", response.body(), probe);
        }
    }
}
