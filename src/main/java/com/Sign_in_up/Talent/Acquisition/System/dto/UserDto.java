package com.Sign_in_up.Talent.Acquisition.System.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserDto {

    private String firstName;
    private String middleName;
    private String lastName;
    private String dateOfBirth;
    private String email;
    private String password;
    private String retypePassword;
    private String mobile;
}
