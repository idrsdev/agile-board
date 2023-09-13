import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1694642897929 implements MigrationInterface {
    name = 'Initial1694642897929'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."role_name_enum" AS ENUM('admin', 'user')`);
        await queryRunner.query(`CREATE TABLE "role" ("id" SERIAL NOT NULL, "name" "public"."role_name_enum" NOT NULL DEFAULT 'user', CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_workspace_role_enum" AS ENUM('owner', 'admin', 'member')`);
        await queryRunner.query(`CREATE TABLE "user_workspace" ("id" SERIAL NOT NULL, "role" "public"."user_workspace_role_enum" NOT NULL, "userId" integer, "workspaceId" integer, CONSTRAINT "PK_baa0fec25dab9d73a98f607458d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "workspace" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ca86b6f9b3be5fe26d307d09b49" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "board_member" ("id" SERIAL NOT NULL, "role" character varying NOT NULL DEFAULT 'member', "boardId" integer, "userId" integer, CONSTRAINT "PK_c27bedbf846391cf1af5e4a74d1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "card_assignment" ("id" SERIAL NOT NULL, "cardId" integer, "userId" integer, CONSTRAINT "PK_80e485b5667fb7d27088d40414c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "comment" ("id" SERIAL NOT NULL, "text" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "authorId" integer, "cardId" integer, CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "card" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, "position" integer NOT NULL DEFAULT '1', "coverColor" character varying, "listId" integer, CONSTRAINT "PK_9451069b6f1199730791a7f4ae4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "list" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "position" integer NOT NULL DEFAULT '0', "boardId" integer, CONSTRAINT "PK_d8feafd203525d5f9c37b3ed3b9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "board" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "visibility" character varying NOT NULL, "createdById" integer, "workspaceId" integer, CONSTRAINT "PK_865a0f2e22c140d261b1df80eb1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "token" ("id" SERIAL NOT NULL, "token" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "REL_94f168faad896c0786646fa3d4" UNIQUE ("userId"), CONSTRAINT "PK_82fae97f905930df5d62a702fc9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_role" ("userId" integer NOT NULL, "roleId" integer NOT NULL, CONSTRAINT "PK_7b4e17a669299579dfa55a3fc35" PRIMARY KEY ("userId", "roleId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ab40a6f0cd7d3ebfcce082131f" ON "user_role" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_dba55ed826ef26b5b22bd39409" ON "user_role" ("roleId") `);
        await queryRunner.query(`ALTER TABLE "user_workspace" ADD CONSTRAINT "FK_4ea12fabb12c08c3dc8839d0932" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_workspace" ADD CONSTRAINT "FK_46438fa9a476521c49324b59843" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "board_member" ADD CONSTRAINT "FK_2f41fdf7c09ac52f708260d811b" FOREIGN KEY ("boardId") REFERENCES "board"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "board_member" ADD CONSTRAINT "FK_648b9cad9a34f1a9601282751ec" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "card_assignment" ADD CONSTRAINT "FK_2596e8d1abcf77e856850dffe25" FOREIGN KEY ("cardId") REFERENCES "card"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "card_assignment" ADD CONSTRAINT "FK_1fd1ed9a09b75cf9bf8cbe3baa3" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_276779da446413a0d79598d4fbd" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_5dd31f454fdc52a2e336264b076" FOREIGN KEY ("cardId") REFERENCES "card"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "card" ADD CONSTRAINT "FK_4267e15872bbabeb7d9c0448ca0" FOREIGN KEY ("listId") REFERENCES "list"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "list" ADD CONSTRAINT "FK_bbb2794eef8a900448a5f487eb5" FOREIGN KEY ("boardId") REFERENCES "board"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "board" ADD CONSTRAINT "FK_d958e9af935f058823a58b09cb9" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "board" ADD CONSTRAINT "FK_394199497c0242b3270d03611bf" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "token" ADD CONSTRAINT "FK_94f168faad896c0786646fa3d4a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_role" ADD CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_role" ADD CONSTRAINT "FK_dba55ed826ef26b5b22bd39409b" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_role" DROP CONSTRAINT "FK_dba55ed826ef26b5b22bd39409b"`);
        await queryRunner.query(`ALTER TABLE "user_role" DROP CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd"`);
        await queryRunner.query(`ALTER TABLE "token" DROP CONSTRAINT "FK_94f168faad896c0786646fa3d4a"`);
        await queryRunner.query(`ALTER TABLE "board" DROP CONSTRAINT "FK_394199497c0242b3270d03611bf"`);
        await queryRunner.query(`ALTER TABLE "board" DROP CONSTRAINT "FK_d958e9af935f058823a58b09cb9"`);
        await queryRunner.query(`ALTER TABLE "list" DROP CONSTRAINT "FK_bbb2794eef8a900448a5f487eb5"`);
        await queryRunner.query(`ALTER TABLE "card" DROP CONSTRAINT "FK_4267e15872bbabeb7d9c0448ca0"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_5dd31f454fdc52a2e336264b076"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_276779da446413a0d79598d4fbd"`);
        await queryRunner.query(`ALTER TABLE "card_assignment" DROP CONSTRAINT "FK_1fd1ed9a09b75cf9bf8cbe3baa3"`);
        await queryRunner.query(`ALTER TABLE "card_assignment" DROP CONSTRAINT "FK_2596e8d1abcf77e856850dffe25"`);
        await queryRunner.query(`ALTER TABLE "board_member" DROP CONSTRAINT "FK_648b9cad9a34f1a9601282751ec"`);
        await queryRunner.query(`ALTER TABLE "board_member" DROP CONSTRAINT "FK_2f41fdf7c09ac52f708260d811b"`);
        await queryRunner.query(`ALTER TABLE "user_workspace" DROP CONSTRAINT "FK_46438fa9a476521c49324b59843"`);
        await queryRunner.query(`ALTER TABLE "user_workspace" DROP CONSTRAINT "FK_4ea12fabb12c08c3dc8839d0932"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dba55ed826ef26b5b22bd39409"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ab40a6f0cd7d3ebfcce082131f"`);
        await queryRunner.query(`DROP TABLE "user_role"`);
        await queryRunner.query(`DROP TABLE "token"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "board"`);
        await queryRunner.query(`DROP TABLE "list"`);
        await queryRunner.query(`DROP TABLE "card"`);
        await queryRunner.query(`DROP TABLE "comment"`);
        await queryRunner.query(`DROP TABLE "card_assignment"`);
        await queryRunner.query(`DROP TABLE "board_member"`);
        await queryRunner.query(`DROP TABLE "workspace"`);
        await queryRunner.query(`DROP TABLE "user_workspace"`);
        await queryRunner.query(`DROP TYPE "public"."user_workspace_role_enum"`);
        await queryRunner.query(`DROP TABLE "role"`);
        await queryRunner.query(`DROP TYPE "public"."role_name_enum"`);
    }

}
