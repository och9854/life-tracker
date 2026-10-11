import { ArrowUpRight, Check, Heart, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

export function PrimitiveShowcase() {
  return <main className="primitive-showcase">
    <header className="showcase-heading">
      <p className="eyebrow">LIFE JOURNAL · DESIGN SYSTEM</p>
      <h1>Small pieces, one familiar place.</h1>
      <p>Reusable controls for writing, planning, and looking back.</p>
    </header>
    <section className="showcase-grid" aria-label="Component preview">
      <Card className="showcase-card">
        <CardHeader><CardTitle>Buttons</CardTitle><CardDescription>Clear actions with a quiet hierarchy.</CardDescription></CardHeader>
        <CardContent className="showcase-row">
          <Button><Sparkles /> Primary</Button><Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button><Button variant="ghost">Quiet</Button>
          <Button variant="destructive">Delete</Button><Button disabled>Unavailable</Button>
        </CardContent>
      </Card>
      <Card className="showcase-card">
        <CardHeader><CardTitle>Writing fields</CardTitle><CardDescription>Labels, focus, and helpful empty states.</CardDescription></CardHeader>
        <CardContent className="showcase-fields">
          <label>Title<Input placeholder="A thought worth keeping" /></label>
          <label>Reflection<Textarea placeholder="Write a few words…" /></label>
          <label>Disabled<Input disabled value="Read only" /></label>
        </CardContent>
      </Card>
      <Card className="showcase-card showcase-progress">
        <CardHeader><CardTitle>One apple slice at a time</CardTitle><CardDescription>Visible progress without turning a missed day into failure.</CardDescription></CardHeader>
        <CardContent className="showcase-row showcase-status"><Badge variant="secondary"><Check /> Saved</Badge><Badge variant="outline">This week · 2 / 4</Badge><Button variant="outline" size="sm"><Heart /> Mark a step</Button><Button size="icon" aria-label="Open detail"><ArrowUpRight /></Button></CardContent>
      </Card>
      <Card className="showcase-card showcase-dialog-card">
        <CardHeader><CardTitle>Focus and touch</CardTitle><CardDescription>Controls stay named and reachable from keyboard or touch.</CardDescription></CardHeader>
        <CardContent><Separator /><p>Use Tab to see the focus ring. Every control has a 44px touch area.</p></CardContent>
      </Card>
    </section>
    <p className="showcase-footnote">Development preview · <code>?showcase=1</code></p>
  </main>;
}
