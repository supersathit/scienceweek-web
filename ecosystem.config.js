module.exports = {
  apps: [
    {
      name: "sic-vit", 
      script: "node_modules/next/dist/bin/next",
      args: "start -p 7979", // กำหนดให้ออก Port 7979
      env: {
        PORT: 7979, // กำหนดให้ออก Port 7979
        NODE_ENV: "production",
      },
    },
  ],
};
