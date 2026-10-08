package com.lifelink.os;

import com.lifelink.os.domain.User;
import com.lifelink.os.domain.Vehicle;
import com.lifelink.os.dto.vehicle.CreateVehicleRequest;
import com.lifelink.os.dto.vehicle.VehicleDto;
import com.lifelink.os.exception.ResourceNotFoundException;
import com.lifelink.os.repository.UserRepository;
import com.lifelink.os.repository.VehicleDocumentRepository;
import com.lifelink.os.repository.VehicleRepository;
import com.lifelink.os.repository.VehicleServiceRecordRepository;
import com.lifelink.os.service.AuditLogService;
import com.lifelink.os.service.NotificationService;
import com.lifelink.os.service.VehicleService;
import com.lifelink.os.service.storage.StorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VehicleServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;
    @Mock
    private VehicleDocumentRepository vehicleDocumentRepository;
    @Mock
    private VehicleServiceRecordRepository vehicleServiceRecordRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private StorageService storageService;
    @Mock
    private NotificationService notificationService;
    @Mock
    private AuditLogService auditLogService;

    private VehicleService vehicleService;

    @BeforeEach
    void setUp() {
        vehicleService = new VehicleService(
                vehicleRepository,
                vehicleDocumentRepository,
                vehicleServiceRecordRepository,
                userRepository,
                storageService,
                notificationService,
                auditLogService
        );
    }

    @Test
    @DisplayName("Create vehicle registers vehicle under authenticated owner")
    void testCreateVehicle() {
        UUID userId = UUID.randomUUID();
        User user = new User("owner@example.com", "hash", "Owner Name", null);
        user.setId(userId);

        CreateVehicleRequest req = new CreateVehicleRequest();
        req.setMake("Toyota");
        req.setModel("Camry");
        req.setYear(2022);
        req.setLicensePlate("9ABC789");
        req.setPrimary(true);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(vehicleRepository.save(any(Vehicle.class))).thenAnswer(inv -> inv.getArgument(0));

        VehicleDto dto = vehicleService.createVehicle(req, userId);

        assertNotNull(dto);
        assertEquals("Toyota", dto.getMake());
        assertEquals("9ABC789", dto.getLicensePlate());
        assertEquals(userId, dto.getUserId());
        assertTrue(dto.isPrimary());
    }

    @Test
    @DisplayName("Accessing a vehicle belonging to another owner throws ResourceNotFoundException")
    void testUnauthorizedVehicleAccess() {
        UUID ownerId = UUID.randomUUID();
        UUID otherUserId = UUID.randomUUID();
        UUID vehicleId = UUID.randomUUID();

        when(vehicleRepository.findByIdAndUserId(vehicleId, otherUserId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> vehicleService.getVehicleById(vehicleId, otherUserId));
    }
}
