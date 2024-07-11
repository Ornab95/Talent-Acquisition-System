package com.Sign_in_up.Talent.Acquisition.System.repository;

import com.Sign_in_up.Talent.Acquisition.System.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    default User findByEmail(String email) {
        return null;
    }
}
