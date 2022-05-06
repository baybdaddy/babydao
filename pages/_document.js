import Document, { Html, Head, Main, NextScript } from "next/document"
import React                                      from "react"

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html>
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="true"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;800&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
          <div
            id="modal"
            className="fixed top-0 h-screen w-screen z-50 bg-[#4b515066] backdrop-blur empty:hidden"
          />
        </body>
      </Html>
    )
  }
}

export default MyDocument
