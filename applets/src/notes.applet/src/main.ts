import { type AppletContext, appletContext } from '@web-applets/sdk';

type State = { text: string };

const doc = document.getElementById('doc') as HTMLDivElement;
const applet = appletContext.connect() as AppletContext<State>;

applet.setActionHandler('write', ({ text }: { text: string }) => {
  applet.setState({ text });
});

doc.oninput = () => {
  applet.setState({ text: doc.innerText }, false);
};

applet.onrender = () => {
  doc.innerText = applet.state?.text;
};
