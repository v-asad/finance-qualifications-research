import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Empty, TopBar } from '../components/ui';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl">
      <TopBar back="/" />
      <Empty icon={<Compass className="h-10 w-10" />} title="This page isn’t in the ledger" body="The link may be out of date."
        action={<Link to="/" replace className="btn btn-primary btn-sm">Go home</Link>} />
    </div>
  );
}
