import Layout from "../../components/Layout";

export default function Login() {
  return (
    <Layout title="Log in">
      <form className="max-w-md">
        <label className="block mb-2">
          <span>Email</span>
          <input className="mt-1 block w-full" type="email" name="email" />
        </label>
        <label className="block mb-4">
          <span>Password</span>
          <input className="mt-1 block w-full" type="password" name="password" />
        </label>
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded">Log in</button>
        </div>
      </form>
    </Layout>
  );
}
