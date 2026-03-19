package com.fwms.repository;

import com.fwms.model.Task;
import com.fwms.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByFarmer(User farmer);
    List<Task> findByWorker(User worker);
    List<Task> findByStatus(Task.TaskStatus status);
    List<Task> findByFarmerAndStatus(User farmer, Task.TaskStatus status);
    List<Task> findByWorkerAndStatus(User worker, Task.TaskStatus status);
    List<Task> findByWorkerIsNullAndStatus(Task.TaskStatus status);

    long countByStatus(Task.TaskStatus status);
    long countByFarmer(User farmer);
    long countByWorker(User worker);

    @org.springframework.data.jpa.repository.Query(
        "SELECT MONTH(t.createdAt), COUNT(t) FROM Task t WHERE YEAR(t.createdAt) = :year GROUP BY MONTH(t.createdAt)")
    List<Object[]> countTasksByMonth(int year);

    @org.springframework.data.jpa.repository.Query(
        "SELECT t.status, COUNT(t) FROM Task t GROUP BY t.status")
    List<Object[]> countByStatusGrouped();
}
