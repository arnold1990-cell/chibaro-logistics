package zw.chibaro;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;
public final class Contracts {
 public record Request(@NotNull UUID submissionKey,@NotBlank @Size(max=150) String fullName,@NotBlank @Pattern(regexp="[+0-9 ()-]{7,30}") String phone,@Email @Size(max=254) String email,@NotBlank @Size(max=500) String pickup,@NotBlank @Size(max=500) String destination,@NotBlank @Size(max=50) String serviceId,@NotBlank @Size(max=5000) String goods,@NotNull @DecimalMin("0.01") @DecimalMax("1000000") BigDecimal weightKg,@NotNull @FutureOrPresent LocalDate preferredDate,@NotNull LocalTime preferredTime,@NotNull @Pattern(regexp="DRY|WET|DISCUSS") String rateType,@Size(max=5000) String instructions,@AssertTrue boolean consent,@Size(max=0) String website){}
 public record QuoteUpdate(@NotNull @Pattern(regexp="NEW|UNDER_REVIEW|QUOTED|ACCEPTED|REJECTED|EXPIRED|CANCELLED") String status,@DecimalMin("0.01") @DecimalMax("999999999999.99") BigDecimal price,@Pattern(regexp="[A-Z]{3}") String currency,@Size(max=5000) String conditions){}
 public record BookingUpdate(@NotNull @Pattern(regexp="REQUESTED|PENDING_CONFIRMATION|CONFIRMED|SCHEDULED|IN_PROGRESS|COMPLETED|CANCELLED") String status,UUID vehicleId,@Size(max=150) String driverName){}
 public record LeadUpdate(@NotNull @Pattern(regexp="NEW|CONTACTED|QUALIFIED|QUOTATION_SENT|CONVERTED|LOST") String status,@Size(max=5000) String notes,LocalDate followUp,UUID assignedTo){}
 public record Contact(@NotBlank @Size(max=150) String fullName,@NotBlank @Pattern(regexp="[+0-9 ()-]{7,30}") String phone,@Email @Size(max=254) String email,@NotBlank @Size(max=5000) String message,@AssertTrue boolean consent,@Size(max=0) String website){}
 public record Chat(@NotBlank @Size(max=2000) String message){}
}
