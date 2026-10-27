package zw.chibaro;
import java.util.*;
import org.springframework.context.annotation.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
@Configuration
public class SecurityConfig {
 @Bean PasswordEncoder passwordEncoder(){return new BCryptPasswordEncoder(12);}
 @Bean UserDetailsService users(JdbcTemplate db){return email -> db.query("select email,password_hash,role,enabled from users where email=?",(r,n)-> User.withUsername(r.getString(1)).password(r.getString(2)).roles(r.getString(3)).disabled(!r.getBoolean(4)).build(),email.toLowerCase(Locale.ROOT)).stream().findFirst().orElseThrow(()->new UsernameNotFoundException("Invalid credentials"));}
 @Bean SecurityFilterChain security(HttpSecurity http, RateLimitFilter rate) throws Exception {
  return http.authorizeHttpRequests(a->a.requestMatchers("/api/v1/auth/csrf","/api/v1/auth/login","/actuator/health").permitAll().requestMatchers("/api/v1/admin/**").hasRole("ADMIN").requestMatchers("/api/v1/auth/me").authenticated().requestMatchers("/api/v1/services","/api/v1/service-areas","/api/v1/fleet","/api/v1/quotes","/api/v1/bookings","/api/v1/contact","/api/v1/assistant/messages").permitAll().anyRequest().denyAll())
   .addFilterBefore(rate,UsernamePasswordAuthenticationFilter.class)
   .formLogin(f->f.loginProcessingUrl("/api/v1/auth/login").usernameParameter("email").successHandler((req,res,auth)->{audit(rate.db,auth.getName(),"LOGIN",null);res.setContentType("application/json");res.getWriter().write("{\"ok\":true}");}).failureHandler((req,res,ex)->{res.setStatus(401);res.setContentType("application/json");res.getWriter().write("{\"detail\":\"Invalid email or password.\"}");}))
   .logout(l->l.logoutUrl("/api/v1/auth/logout").logoutSuccessHandler((req,res,auth)->res.setStatus(204)).deleteCookies("SESSION"))
   .exceptionHandling(e->e.authenticationEntryPoint((req,res,ex)->{res.setStatus(401);res.setContentType("application/json");res.getWriter().write("{\"detail\":\"Please sign in.\"}");}).accessDeniedHandler((req,res,ex)->{res.setStatus(403);res.setContentType("application/json");res.getWriter().write("{\"detail\":\"Access denied or security token expired. Refresh and try again.\"}");}))
   .sessionManagement(s->s.sessionFixation(f->f.migrateSession())).build();
 }
 static void audit(JdbcTemplate db,String actor,String action,String id){db.update("insert into audit_logs(id,actor,action,resource_id) values (?,?,?,?)",UUID.randomUUID(),actor,action,id);}
 @Bean CommandLineRunner bootstrap(JdbcTemplate db,PasswordEncoder encoder,@Value("${app.bootstrap-email}") String email,@Value("${app.bootstrap-password}") String password){return args->{if(email.isBlank()||password.isBlank())return;if(password.length()<16)throw new IllegalStateException("Bootstrap password must contain at least 16 characters");db.update("insert into users(id,email,password_hash,role) values (?,?,?,'ADMIN') on conflict(email) do nothing",UUID.randomUUID(),email.toLowerCase(Locale.ROOT),encoder.encode(password));};}
}
