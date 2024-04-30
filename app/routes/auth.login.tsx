import {ActionFunctionArgs} from '@remix-run/node';
import {authenticator} from '~/services/auth.server';

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
  return <p>Heeeeey....so there is a problem with your password</p>;
}
