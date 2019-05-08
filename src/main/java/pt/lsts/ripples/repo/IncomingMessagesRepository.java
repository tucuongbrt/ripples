package pt.lsts.ripples.repo;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import pt.lsts.ripples.domain.soi.IncomingMessage;

@Repository
public interface IncomingMessagesRepository extends CrudRepository<IncomingMessage, Long>{
    List<IncomingMessage> findByAssetName(String assetName);
    
    @Query("select m from IncomingMessage m where m.timestampMs > :timestampMs and assetName = :assetName")
    List<IncomingMessage> findAllSinceDateForAsset(long timestampMs, String assetName);
}