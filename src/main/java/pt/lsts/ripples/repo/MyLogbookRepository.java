package pt.lsts.ripples.repo;

import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import pt.lsts.ripples.domain.logbook.MyLogbook;

@Repository
public interface MyLogbookRepository extends CrudRepository<MyLogbook, String> {
  public List<MyLogbook> findAllByOrderByDateDesc();
}