// import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

// @Entity()
// export class JiraIssue {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column()
//   issueId: string;

//   @Column('text')
//   summary: string;

//   @Column()
//   status: string;

//   @Column('timestamp')
//   createdAt: Date;
// }

// src/entities/issue.entity.ts
import { Entity, Column, PrimaryColumn } from 'typeorm';

class Status {
  @Column()
  name: string;
}

class Assignee {
  @Column()
  displayName: string;

  @Column()
  emailAddress: string;
}

class Priority {
  @Column()
  name: string;
}

@Entity()
export class JiraIssue {
  @PrimaryColumn()
  id: string;

  @Column()
  created: Date;

  @Column()
  updated: Date;

  @Column((type) => Status)
  status: Status;

  @Column((type) => Assignee)
  assignee: Assignee;

  @Column((type) => Priority)
  priority: Priority;

  @Column()
  summary: string;
}
