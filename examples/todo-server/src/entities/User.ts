import { Field, GraphityEntity } from "graphity";
import { GraphQLID, GraphQLNonNull, GraphQLString } from "graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@GraphityEntity({
  name: "User",
})
@Entity({
  name: "users",
})
export class User {
  @Field((_) => GraphQLNonNull(GraphQLID))
  @PrimaryGeneratedColumn()
  id!: string | number;

  @Field((_) => GraphQLString)
  @Column({ type: String, nullable: true })
  name!: string | null;

  @Column({ type: String, name: "github_id", nullable: true })
  githubId!: string | null;

  @Column({ type: String, name: "github_token", nullable: true })
  githubToken!: string | null;
}
