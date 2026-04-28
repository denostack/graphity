import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsers1611815680662 implements MigrationInterface {
  async up(runner: QueryRunner): Promise<void> {
    await runner.query(`CREATE TABLE \`users\` (
          \`id\` int(11) unsigned NOT NULL AUTO_INCREMENT,
          \`name\` varchar(100) DEFAULT NULL,
          \`github_id\` varchar(100) DEFAULT NULL,
          \`github_token\` text DEFAULT NULL,
          \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          KEY \`github\`(\`github_id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    await runner.query("ALTER TABLE `todos` ADD COLUMN `user_id` int(11) NOT NULL AFTER `id`");
  }

  async down(runner: QueryRunner): Promise<void> {
    await runner.query("DROP TABLE `users`");
    await runner.query("ALTER TABLE `todos` DROP COLUMN `user_id`");
  }
}
