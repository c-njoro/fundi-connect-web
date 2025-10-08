export default function ForgotPassword() {
  return (
    <>
      <form className="max-w-md">
        <label className="block mb-4">
          <span>Email</span>
          <input className="mt-1 block w-full" type="email" name="email" />
        </label>
        <button className="px-4 py-2 bg-yellow-600 text-white rounded">Send reset link</button>
      </form>
    </>
  );
}
