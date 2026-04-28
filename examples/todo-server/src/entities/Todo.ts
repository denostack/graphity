import { Field, GraphityEntity } from "graphity";
import { GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLString } from "graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@GraphityEntity({
  name: "Todo",
  description: "Todo Entity",
})
@Entity({ name: "todos" })
export class Todo {
  @Field((_) => GraphQLNonNull(GraphQLID))
  @PrimaryGeneratedColumn()
  id!: string | number;

  @Column({ type: String, name: "user_id" })
  userId!: string | number;

  @Field((_) => GraphQLNonNull(GraphQLString), {
    description: "do what you want to do",
  })
  @Column({ type: String })
  title!: string;

  @Field((_) => GraphQLNonNull(GraphQLBoolean))
  @Column({ type: Boolean, default: false })
  completed!: boolean;
}
