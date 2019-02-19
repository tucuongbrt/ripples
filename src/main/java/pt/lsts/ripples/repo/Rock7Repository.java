package pt.lsts.ripples.repo;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import pt.lsts.ripples.domain.iridium.Rock7Message;

@Repository
public interface Rock7Repository extends CrudRepository<Rock7Message, Long> {
    List<Rock7Message> findBySource(String source);

    List<Rock7Message> findByDestination(String destination);

    @Query("select m from Rock7Message m where m.created_at > :date")
    List<Rock7Message> findSince(@Param("date") Date since);
    @Query("select m from Rock7Message m where m.created_at > :date and m.isPlainText = true")
    List<Rock7Message> findPlainTextSince(@Param("date") Date since);


}
