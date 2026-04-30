import  {NextConfig}  from "next";

const nextConfig: NextConfig = {
  /* config options here */
    turbopack: {
      // Указывает текущую директорию как корень проекта
      root: __dirname, 
    },
};

export default nextConfig;
