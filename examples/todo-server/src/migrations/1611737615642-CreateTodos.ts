import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTodos1611737615642 implements MigrationInterface {
  async up(runner: QueryRunner): Promise<void> {
    await runner.query(`CREATE TABLE \`todos\` (
      \`id\` int(11) unsigned NOT NULL AUTO_INCREMENT,
      \`title\` text NOT NULL,
      \`completed\` tinyint(1) NOT NULL DEFAULT '0',
      \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  }

  async down(runner: QueryRunner): Promise<void> {
    await runner.query("DROP TABLE `todos`");
  }
}
