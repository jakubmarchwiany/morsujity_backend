let { FRONT_ENDPOINT } = process.env;

function verificationMessage(hash: string) {
    return `
    <!DOCTYPE html>
    <html>
    <header style="box-sizing: border-box;display: block;">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    </header>
    <body style="background: #f0f2f5;box-sizing: border-box;margin: 0;font-family: -apple-system,BlinkMacSystemFont,&quot;Segoe UI&quot;,Roboto,&quot;Helvetica Neue&quot;,Arial,sans-serif,&quot;Apple Color Emoji&quot;,&quot;Segoe UI Emoji&quot;,&quot;Segoe UI Symbol&quot;;font-size: 1rem;font-weight: 400;line-height: 1.5;color: #212529;text-align: left;background-color: #fff;min-width: 992px!important;">
    <table class="body bg-light" style="box-sizing: border-box;border-collapse: collapse;background-color: #f8f9fa!important;">
      <div class="row my-5" style="box-sizing: border-box;display: flex;-ms-flex-wrap: wrap;flex-wrap: wrap;margin-right: -15px;margin-left: -15px;margin-top: 3rem!important;margin-bottom: 3rem!important;">
        <div class="col-2" style="box-sizing: border-box;position: relative;width: 100%;min-height: 1px;padding-right: 15px;padding-left: 15px;-webkit-box-flex: 0;-ms-flex: 0 0 16.666667%;flex: 0 0 16.666667%;max-width: 16.666667%;"></div>
        <div class="col-8 text-center bg-white shadow-lg rounded-3 px-5 pb-4" style="box-sizing: border-box;position: relative;width: 100%;min-height: 1px;padding-right: 3rem!important;padding-left: 3rem!important;-webkit-box-flex: 0;-ms-flex: 0 0 66.666667%;flex: 0 0 66.666667%;max-width: 66.666667%;background-color: #fff!important;padding-bottom: 1.5rem!important;text-align: center!important;">
          <div class="h5 mt-3" style="color: #468faf;box-sizing: border-box;margin-bottom: .5rem;font-family: inherit;font-weight: 500;line-height: 1.2;font-size: 1.25rem;margin-top: 1rem!important;">Morsujity</div>
          <div class="h2 mt-3" style="box-sizing: border-box;margin-bottom: .5rem;font-family: inherit;font-weight: 500;line-height: 1.2;color: black;font-size: 2rem;margin-top: 1rem!important;">Zweryfikuj swoje konto</div>
          <p class="my-4" style="box-sizing: border-box;margin-top: 1.5rem!important;margin-bottom: 1.5rem!important;orphans: 3;widows: 3;color: black;">
            Potwierdź, że chcesz użyć tego adresu e-mail do konta Morsujity. <br style="box-sizing: border-box;">Gdy to zrobisz, będziesz mógł zacząć korzystać z serwisu
          </p>
          <a class="btn btn-primary" href="${FRONT_ENDPOINT}/auth/verifyEmail/${hash}" style="background: #468faf;color: #fff;box-sizing: border-box;text-decoration: none;background-color: #468faf;-webkit-text-decoration-skip: objects;display: inline-block;font-weight: 400;text-align: center;white-space: nowrap;vertical-align: middle;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;border: 1px solid transparent;padding: .375rem .75rem;font-size: 1rem;line-height: 1.5;border-radius: .25rem;transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;border-color: #468faf;">Zweryfikuj moje konto</a>
          
          
          <p class="mt-4" style="box-sizing: border-box;margin-top: 1.5rem!important;margin-bottom: 1rem;orphans: 3;widows: 3;color: black;">
            Lub skopiuj ten link do swojej przeglądarki
          </p>
          <a href="${FRONT_ENDPOINT}/auth/verifyEmail/${hash}" class="link-warning" style="box-sizing: border-box;color: #ffc107;text-decoration: underline;-webkit-text-decoration-skip: objects;">${FRONT_ENDPOINT}/auth/verifyEmail/${hash}</a>
        </div>
      </div>
    </table>
    </body>
    </html>
    `;
}

// <body style="background: #f0f2f5">
// <table class="body bg-light">
//   <div class="row my-5">

//     <div class="col-2"></div>
//     <div class="col-8 text-center bg-white shadow-lg rounded-3 px-5 pb-4">
//       <div class="h5 mt-3" style="color: #468faf">Morsujity</div>
//       <div class="h2 mt-3">Zweryfikuj swoje konto</div>
//       <p class="my-4">
//         Potwierdź, że chcesz użyć tego adresu e-mail do konta Morsujity. <br>Gdy to zrobisz, będziesz mógł zacząć korzystać z serwisu
//       </p>
//       <a class="btn btn-primary" href="#" role="button" style="background: #468faf;color: #fff">Zweryfikuj moje konto</a>
//       <p class="mt-4">
//         Lub skopiuj ten link do swojej przeglądarki
//       </p>
//       <a href="http://morsujity.pl/verification/${hash}" class="link-warning">http://morsujity.pl/verification/${hash}</a>
//     </div>
//   </div>
//  </table>
// </body>

export default verificationMessage;
