import {ActionFunctionArgs, LoaderFunctionArgs, json} from '@remix-run/node';
import {
  Form,
  useLoaderData,
  useLocation,
  useSearchParams,
} from '@remix-run/react';
import {authenticator} from '~/services/auth.server';

export async function loader(args: LoaderFunctionArgs) {
  return json({user: await authenticator.isAuthenticated(args.request)});
}

export async function action({request}: ActionFunctionArgs) {
  const formData = await request.formData();

  return await authenticator.authenticate('form', request, {
    successRedirect: (formData.get('redirectTo') as string) || '/',
    failureRedirect: '/auth/login',
    context: {
      formData,
    },
  });
}

export default function Login() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const {user} = useLoaderData<typeof loader>();

  return !user ? (
    <div className="flex flex-col flex-wrap items-center mt-20 gap-3">
      <Form action="/auth/login" method="post" className="flex flex-wrap gap-3">
        <input
          type="input"
          name="redirectTo"
          readOnly
          value={searchParams.get('redirectTo') || location.pathname}
          hidden
        />
        <div className="w-full">
          <label htmlFor="nameInput">Name:</label>
          <input
            type="input"
            id="nameInput"
            className="my-4 w-full"
            autoFocus
            autoComplete={'name'}
            name="name"
          />
        </div>
        <button type="submit" className="w-full">
          Anon Login
        </button>
      </Form>
      {/* <Form action="/auth/github" method="post">
        <button>Login with GitHub</button>
      </Form> */}
    </div>
  ) : (
    <Form method="post" action="/auth/logout">
      <button type="submit">Log Out</button>
    </Form>
  );
}
