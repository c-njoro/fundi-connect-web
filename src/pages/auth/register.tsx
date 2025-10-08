import Layout from "../../components/Layout";

export default function Register() {
  return (
    <Layout title="Register">
      <form className="max-w-md">
        <label className="block mb-2">
          <span>Name</span>
          <input className="mt-1 block w-full" type="text" name="name" />
        </label>
        <label className="block mb-2">
          <span>Email</span>
          <input className="mt-1 block w-full" type="email" name="email" />
        </label>
        <label className="block mb-4">
          <span>Password</span>
          <input className="mt-1 block w-full" type="password" name="password" />
        </label>
        <button className="px-4 py-2 bg-green-600 text-white rounded">Create account</button>
      </form>
    </Layout>
  );
}
