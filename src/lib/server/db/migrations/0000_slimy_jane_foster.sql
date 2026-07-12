CREATE TABLE `Categorias` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nome` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Categorias_nome_unique` ON `Categorias` (`nome`);--> statement-breakpoint
CREATE TABLE `Insumos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`cod_fabricacao` text NOT NULL,
	`cod_interno` text NOT NULL,
	`nome` text NOT NULL,
	`observacoes` text,
	`foto_path` text,
	`material` text,
	`ferramenta` integer DEFAULT false NOT NULL,
	`tipo` integer,
	`altura_min` real,
	`altura_max` real,
	`rpm` real,
	`avanco_min` real,
	`categoria` integer,
	`criado_em` integer NOT NULL,
	`atualizado_em` integer NOT NULL,
	`adicionado_por` integer NOT NULL,
	FOREIGN KEY (`tipo`) REFERENCES `TiposFerramentas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`categoria`) REFERENCES `Categorias`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`adicionado_por`) REFERENCES `Usuarios`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Insumos_cod_fabricacao_unique` ON `Insumos` (`cod_fabricacao`);--> statement-breakpoint
CREATE UNIQUE INDEX `Insumos_cod_interno_unique` ON `Insumos` (`cod_interno`);--> statement-breakpoint
CREATE TABLE `InsumosFerramentas` (
	`insumo_id` integer NOT NULL,
	`ferramenta_id` integer NOT NULL,
	`quantidade` integer NOT NULL,
	PRIMARY KEY(`insumo_id`, `ferramenta_id`),
	FOREIGN KEY (`insumo_id`) REFERENCES `Insumos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`ferramenta_id`) REFERENCES `Insumos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `InsumosMaquinas` (
	`insumo_id` integer NOT NULL,
	`maquina_id` integer NOT NULL,
	PRIMARY KEY(`insumo_id`, `maquina_id`),
	FOREIGN KEY (`insumo_id`) REFERENCES `Insumos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`maquina_id`) REFERENCES `Maquinas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `InsumosOcorrencias` (
	`insumo_id` integer NOT NULL,
	`ocorrencia_id` integer NOT NULL,
	`quantidade` integer NOT NULL,
	PRIMARY KEY(`insumo_id`, `ocorrencia_id`),
	FOREIGN KEY (`insumo_id`) REFERENCES `Insumos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`ocorrencia_id`) REFERENCES `Ocorrencias`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Maquinas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nome` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Maquinas_nome_unique` ON `Maquinas` (`nome`);--> statement-breakpoint
CREATE TABLE `Ocorrencias` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`status` integer NOT NULL,
	`prioridade` integer NOT NULL,
	`data` integer NOT NULL,
	`solicitante` text NOT NULL,
	`justificativa` text NOT NULL,
	`aprovador_por` integer,
	`data_aprovacao` integer,
	`observacao` text,
	`maquina` integer NOT NULL,
	FOREIGN KEY (`aprovador_por`) REFERENCES `Usuarios`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`maquina`) REFERENCES `Maquinas`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "status_check" CHECK("Ocorrencias"."status" in (0, 1)),
	CONSTRAINT "prioridade_check" CHECK("Ocorrencias"."prioridade" in (0, 1, 2, 3))
);
--> statement-breakpoint
CREATE TABLE `TiposFerramentas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nome` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `TiposFerramentas_nome_unique` ON `TiposFerramentas` (`nome`);--> statement-breakpoint
CREATE TABLE `Usuarios` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nome` text NOT NULL,
	`admin` integer DEFAULT false NOT NULL,
	`gestor` integer DEFAULT false NOT NULL,
	`senha` text NOT NULL,
	`criado_em` integer NOT NULL,
	`atualizado_em` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Usuarios_nome_unique` ON `Usuarios` (`nome`);