<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { FormEventHandler } from 'svelte/elements';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Trash } from 'lucide-svelte';
	import { flip } from 'svelte/animate';
	import { scale } from 'svelte/transition';

	export let data;

	type Todo = (typeof data)['todos'][number];

	let submitQueue = 0;

	const enhanceAddTodoForm = (({ formData, formElement }) => {
		submitQueue++;
		formElement.reset();
		const objectFormData = Object.fromEntries(formData.entries()) as unknown as Pick<Todo, 'title'>;
		const id = crypto.randomUUID();
		formData.append('id', id);
		data.todos = [
			...data.todos,
			{
				...objectFormData,
				done: false,
				id
			}
		];
		return ({ update }) => update({ invalidateAll: !--submitQueue });
	}) satisfies SubmitFunction;

	const enhanceUpdateTodoForm = (({ formData, cancel }) => {
		submitQueue++;
		const objectFormData = Object.fromEntries(formData.entries()) as unknown as Omit<
			Todo,
			'done'
		> & { done?: 'on' };
		const todo = data.todos.find((todo) => todo.id === objectFormData.id);
		if (!todo) return cancel();
		const newTodo = {
			title: objectFormData.title.trim() || todo.title,
			done: !!objectFormData.done,
			id: todo.id
		} satisfies Todo;
		if (newTodo.title === todo.title && newTodo.done === todo.done) {
			data.todos = data.todos;
			return cancel();
		}
		data.todos = data.todos.map((todo) => (todo.id === newTodo.id ? newTodo : todo));

		return ({ update }) => update({ reset: false, invalidateAll: !--submitQueue });
	}) satisfies SubmitFunction;

	const enhanceDeleteTodoForm = (({ formData }) => {
		submitQueue++;
		const objectFormData = Object.fromEntries(formData.entries());
		data.todos = data.todos.filter((todo) => todo.id !== objectFormData.id);
		return ({ update }) => update({ invalidateAll: --submitQueue === 0 });
	}) satisfies SubmitFunction;

	const submitOnChange = ((e) => {
		e.currentTarget.requestSubmit();
	}) satisfies FormEventHandler<HTMLFormElement>;
</script>

<svelte:head>
	<title>Todo App</title>
</svelte:head>

<form
	class="flex w-screen max-w-screen-sm gap-2"
	method="post"
	action="?/add-todo"
	use:enhance={enhanceAddTodoForm}
>
	<Input class="" placeholder="New Todo" name="title" />
	<Button class="hide" type="submit">Add</Button>
</form>

<ul class="grid gap-2">
	{#each data.todos as { title, done, id } (id)}
		<li class="flex gap-3 *:contents" animate:flip transition:scale>
			<form
				method="post"
				action="?/update-todo"
				on:change={submitOnChange}
				use:enhance={enhanceUpdateTodoForm}
			>
				<input type="hidden" name="id" value={id} />
				<input class="accent-primary" type="checkbox" name="done" checked={done} />
				<Input
					name="title"
					class="flex-1 capitalize {done ? 'line-through' : 'no-underline'}"
					value={title}
				/>
				<Button class="hide" type="submit">Save</Button>
			</form>
			<form method="post" action="?/delete-todo" use:enhance={enhanceDeleteTodoForm}>
				<input type="hidden" name="id" value={id} />
				<Button size="icon" type="submit" variant="destructive">
					<Trash size="1rem" />
				</Button>
			</form>
		</li>
	{/each}
</ul>
