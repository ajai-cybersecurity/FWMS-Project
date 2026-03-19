package com.fwms.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "ratings",
       uniqueConstraints = @UniqueConstraint(columnNames = {"task_id", "rater_id"}))
public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "task_id", nullable = false)
    private Long taskId;

    @Column(name = "rater_id", nullable = false)
    private Long raterId;

    @Column(name = "rated_id", nullable = false)
    private Long ratedId;

    // FARMER_TO_WORKER or WORKER_TO_FARMER
    @Column(nullable = false)
    private String ratingType;

    @Column(nullable = false)
    private int stars; // 1-5

    @Column(length = 500)
    private String comment;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public Rating() {}

    public Long getId() { return id; }
    public Long getTaskId() { return taskId; }
    public void setTaskId(Long v) { this.taskId = v; }
    public Long getRaterId() { return raterId; }
    public void setRaterId(Long v) { this.raterId = v; }
    public Long getRatedId() { return ratedId; }
    public void setRatedId(Long v) { this.ratedId = v; }
    public String getRatingType() { return ratingType; }
    public void setRatingType(String v) { this.ratingType = v; }
    public int getStars() { return stars; }
    public void setStars(int v) { this.stars = v; }
    public String getComment() { return comment; }
    public void setComment(String v) { this.comment = v; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
