'use client';

import DomainSkillMap from '@/components/growth/DomainSkillMap';
import { DOMAIN_REGISTRY } from '@/data/domain-tracks';

const hrDomain = DOMAIN_REGISTRY['hr']!;

export default function SkillMapPage() {
  return <DomainSkillMap domainLabel="HR" tracks={hrDomain.tracks} backHref="/growth/career-sphere" />;
}
