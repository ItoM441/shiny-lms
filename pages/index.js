// pages/index.js
import Layout from '../components/Layout';

export default function Home() {
  return (
    <Layout>
      <div className="py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">
            IT学習管理アプリへようこそ
          </h1>
          <p className="mb-8 text-lg">
            コースを選択して学習を記録し、効率的に学習を進めましょう。
          </p>
        </div>
      </div>
    </Layout>
  );
}