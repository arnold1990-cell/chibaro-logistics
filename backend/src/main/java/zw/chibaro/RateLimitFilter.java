package zw.chibaro;
import java.io.IOException;
import java.time.Duration;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
@Component
public class RateLimitFilter extends OncePerRequestFilter {
 final JdbcTemplate db; private final StringRedisTemplate redis;
 public RateLimitFilter(JdbcTemplate db,StringRedisTemplate redis){this.db=db;this.redis=redis;}
 @Override protected void doFilterInternal(HttpServletRequest req,HttpServletResponse res,FilterChain chain)throws ServletException,IOException{
  String path=req.getRequestURI();
  if(req.getMethod().equals("POST") && (path.equals("/api/v1/auth/login")||!path.startsWith("/api/v1/admin/"))){
   if(req.getContentLengthLong()>65536){res.sendError(413);return;}
   try {String key="chibaro:rate:"+req.getRemoteAddr()+":"+path+":"+(System.currentTimeMillis()/60000);Long count=redis.opsForValue().increment(key);if(count!=null&&count==1)redis.expire(key,Duration.ofMinutes(2));if(count!=null&&count>15){res.setStatus(429);res.setHeader("Retry-After","60");res.setContentType("application/json");res.getWriter().write("{\"detail\":\"Too many requests. Please wait a minute.\"}");return;}}
   catch(org.springframework.data.redis.RedisConnectionFailureException ex){res.sendError(503);return;}
  }
  chain.doFilter(req,res);
 }
}
