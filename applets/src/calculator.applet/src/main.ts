import { appletContext } from '@web-applets/sdk';

const applet = appletContext.connect();

applet.setActionHandler('calculate', ({ expr }) => {
  applet.setState({ expr });
  const answer = eval(expr);
  applet.setState({ expr, answer });
});

applet.onrender = () => {
  console.log(applet.state);
  document.body.innerHTML = `
    <div class="expression">${applet.state.expr}</div>
    <div class="answer">${applet.state.answer}</div>
  `;
};
