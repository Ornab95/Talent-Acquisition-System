package com.Sign_in_up.Talent.Acquisition.System.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "user")
public class User {
    @Id
    private String id;
    private String firstName;
    private String middleName;
    private String lastName;
    private String dateOfBirth;
    private String email;
    private String password;
    private String mobile;
}
