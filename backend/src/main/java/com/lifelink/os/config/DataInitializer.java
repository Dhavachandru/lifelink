package com.lifelink.os.config;

import com.lifelink.os.domain.User;
import com.lifelink.os.domain.UserSettings;
import com.lifelink.os.repository.UserRepository;
import com.lifelink.os.repository.UserSettingsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            UserSettingsRepository userSettingsRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userSettingsRepository = userSettingsRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        String demoEmail = "driver@lifelink.os";
        String demoPassword = "Lifelink123!";

        Optional<User> existingUser = userRepository.findByEmail(demoEmail);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setPasswordHash(passwordEncoder.encode(demoPassword));
            user.setDemo(true);
            userRepository.save(user);
            log.info("Verified demo user: {}", demoEmail);
        } else {
            User newUser = new User();
            newUser.setId(UUID.fromString("a0000000-0000-0000-0000-000000000001"));
            newUser.setEmail(demoEmail);
            newUser.setPasswordHash(passwordEncoder.encode(demoPassword));
            newUser.setFullName("Alex Mercer");
            newUser.setPhoneNumber("+1 (555) 234-5678");
            newUser.setRole("USER");
            newUser.setDemo(true);
            userRepository.save(newUser);

            UserSettings settings = new UserSettings(newUser);
            userSettingsRepository.save(settings);
            log.info("Initialized demo user: {}", demoEmail);
        }
    }
}
