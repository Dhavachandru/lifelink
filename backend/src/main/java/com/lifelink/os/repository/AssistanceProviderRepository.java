package com.lifelink.os.repository;

import com.lifelink.os.domain.AssistanceProvider;
import com.lifelink.os.domain.enums.ProviderType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AssistanceProviderRepository extends JpaRepository<AssistanceProvider, UUID> {
    List<AssistanceProvider> findByActiveTrue();
    List<AssistanceProvider> findByActiveTrueAndProviderType(ProviderType providerType);
}
