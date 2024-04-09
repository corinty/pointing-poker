CREATE TABLE `rooms` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`active_story_id` integer,
	`display_votes` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`active_story_id`) REFERENCES `stories`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `stories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer NOT NULL,
	`description` text DEFAULT '',
	`final_points` numeric,
	`room_id` text NOT NULL,
	FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY DEFAULT 'ce4a977d-0a5b-4027-a3f5-f5666fac00b9' NOT NULL,
	`created_at` integer,
	`name` text,
	`email` text,
	FOREIGN KEY (`id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `votes` (
	`created_at` integer DEFAULT 2024-04-09T15:08:29.328Z NOT NULL,
	`updated_at` integer DEFAULT 2024-04-09T15:08:29.328Z NOT NULL,
	`story_id` integer NOT NULL,
	`points` numeric,
	`users` text NOT NULL,
	PRIMARY KEY(`story_id`, `users`),
	FOREIGN KEY (`story_id`) REFERENCES `stories`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`users`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_key` ON `users` (`email`);