package zw.chibaro;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.dao.DataIntegrityViolationException;
@RestControllerAdvice
public class ApiErrors {
 @ExceptionHandler(MethodArgumentNotValidException.class) ResponseEntity<ProblemDetail> validation(MethodArgumentNotValidException ex){return problem(400,"Please check the request fields: "+ex.getBindingResult().getFieldErrors().stream().map(e->e.getField()).distinct().sorted().reduce((a,b)->a+", "+b).orElse("invalid request"));}
 @ExceptionHandler(ResponseStatusException.class) ResponseEntity<ProblemDetail> status(ResponseStatusException ex){return problem(ex.getStatusCode().value(),ex.getReason());}
 @ExceptionHandler({IllegalArgumentException.class,org.springframework.http.converter.HttpMessageNotReadableException.class}) ResponseEntity<ProblemDetail> invalid(Exception ex){return problem(400,"Invalid request format.");}
 @ExceptionHandler(DataIntegrityViolationException.class) ResponseEntity<ProblemDetail> conflict(Exception ex){return problem(409,"This request conflicts with an existing record. Refresh and try again.");}
 private ResponseEntity<ProblemDetail> problem(int status,String message){return ResponseEntity.status(status).body(ProblemDetail.forStatusAndDetail(HttpStatusCode.valueOf(status),message));}
}
