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
    "spring.session.redis.namespace=chibaro:test:health:sessions",
    "app.bootstrap-email=", "app.bootstrap-password=", "PUBLISHING_ENABLED=false",
    "management.endpoint.health.probes.enabled=false"
})
class HealthSecurityTest {
    @Value("${local.server.port}") int port;
    private final HttpClient client = HttpClient.newHttpClient();

    HttpResponse<String> request(String method, String path) throws Exception {
        return client.send(HttpRequest.newBuilder(URI.create("http://localhost:" + port + path))
            .method(method, HttpRequest.BodyPublishers.noBody()).build(), HttpResponse.BodyHandlers.ofString());
    }

    @Test void anonymousHealthReturnsOnlyAggregateStatus() throws Exception {
        var response = request("GET", "/actuator/health");
        assertEquals(200, response.statusCode());
        // Exact payload also guards against database, Redis, disk and exception details leaking.
        assertEquals("{\"status\":\"UP\"}", response.body());
    }

    @Test void protectedApisStillRequireAuthentication() throws Exception {
        for (String path : new String[]{"/api/v1/admin/quotes", "/api/v1/auth/me"}) {
            var response = request("GET", path);
            assertEquals(401, response.statusCode(), path);
            assertEquals("{\"detail\":\"Please sign in.\"}", response.body());
        }
    }

    @Test void sensitiveActuatorEndpointsRemainInaccessible() throws Exception {
        for (String path : new String[]{"/actuator", "/actuator/env", "/actuator/configprops",
                "/actuator/heapdump", "/actuator/threaddump", "/actuator/metrics", "/actuator/mappings"}) {
            var response = request("GET", path);
            assertEquals(401, response.statusCode(), path);
            assertEquals("{\"detail\":\"Please sign in.\"}", response.body());
        }
    }

    @Test void anonymousPermissionIsLimitedToGet() throws Exception {
        assertEquals(401, request("HEAD", "/actuator/health").statusCode());
        assertEquals(403, request("POST", "/actuator/health").statusCode());
        assertEquals(403, request("POST", "/api/v1/quotes").statusCode());
    }
}
