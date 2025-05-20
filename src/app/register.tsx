// src/app/register.tsx
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const RegisterPage = () => {
const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  const email = (event.target as HTMLFormElement).email.value;
  const password = (event.target as HTMLFormElement).password.value;

    try {
      const userCredentials = await createUserWithEmailAndPassword(getAuth(), email, password);
      console.log('註冊成功：', userCredentials);
    } catch (error) {
      console.error('註冊失敗：', error);
    }
  };

  return (
    <div>
      <h1>註冊</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">電子郵件：</label>
          <input type="email" id="email" name="email" />
        </div>
        <div>
          <label htmlFor="password">密碼：</label>
          <input type="password" id="password" name="password" />
        </div>
        <button type="submit">註冊</button>
      </form>
    </div>
  );
};

export default RegisterPage;
