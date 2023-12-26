const DB = [{ title: 'test', done: false, id: crypto.randomUUID() }];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const load = () => ({
	todos: DB
});

export const actions = {
	['add-todo']: async ({ request }) => {
		await sleep(1000);
		const formData = Object.fromEntries((await request.formData()).entries()) as unknown as Pick<
			(typeof DB)[number],
			'title'
		> &
			Partial<Pick<(typeof DB)[number], 'done'>>;
		if (!formData.title.trim()) return;
		formData.title = formData.title.trim();
		DB.push({ id: crypto.randomUUID(), ...formData, done: false });
	},
	['delete-todo']: async ({ request }) => {
		await sleep(1000);
		const formData = Object.fromEntries((await request.formData()).entries()) as unknown as Pick<
			(typeof DB)[number],
			'id'
		>;
		DB.splice(
			DB.findIndex((todo) => todo.id === formData.id),
			1
		);
	},
	['update-todo']: async ({ request }) => {
		await sleep(1000);
		const formData = Object.fromEntries((await request.formData()).entries()) as unknown as Pick<
			(typeof DB)[number],
			'id' | 'title'
		> & { done?: 'on' };
		const todo = DB.find((todo) => todo.id === formData.id);
		if (!todo) return;
		todo.done = !!formData?.done;
		if (!formData.title.trim()) return;
		todo.title = formData.title.trim() as string;
	}
};
