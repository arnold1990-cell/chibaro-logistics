package zw.chibaro;
import javax.crypto.Cipher;import javax.crypto.spec.*;import java.security.SecureRandom;import java.util.*;import java.nio.charset.StandardCharsets;
/** Versioned authenticated encryption. Key must be supplied outside the database. */
public final class TokenVault {
 private final SecretKeySpec key;private final SecureRandom random=new SecureRandom();
 public TokenVault(String base64Key){byte[] decoded=Base64.getDecoder().decode(base64Key);if(decoded.length!=32)throw new IllegalArgumentException("A 256-bit encryption key is required");key=new SecretKeySpec(decoded,"AES");}
 public String encrypt(String accountId,String token){try{byte[] iv=new byte[12];random.nextBytes(iv);Cipher cipher=Cipher.getInstance("AES/GCM/NoPadding");cipher.init(Cipher.ENCRYPT_MODE,key,new GCMParameterSpec(128,iv));cipher.updateAAD(accountId.getBytes(StandardCharsets.UTF_8));return "v1."+Base64.getEncoder().encodeToString(iv)+"."+Base64.getEncoder().encodeToString(cipher.doFinal(token.getBytes(StandardCharsets.UTF_8)));}catch(Exception ex){throw new IllegalStateException("Credential encryption failed");}}
 public String decrypt(String accountId,String ciphertext){try{String[] parts=ciphertext.split("\\.");if(parts.length!=3||!parts[0].equals("v1"))throw new IllegalArgumentException();Cipher cipher=Cipher.getInstance("AES/GCM/NoPadding");cipher.init(Cipher.DECRYPT_MODE,key,new GCMParameterSpec(128,Base64.getDecoder().decode(parts[1])));cipher.updateAAD(accountId.getBytes(StandardCharsets.UTF_8));return new String(cipher.doFinal(Base64.getDecoder().decode(parts[2])),StandardCharsets.UTF_8);}catch(Exception ex){throw new IllegalStateException("Credential authentication failed");}}
}
