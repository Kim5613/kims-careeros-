'use client';

import DomainSkillMap from '@/components/growth/DomainSkillMap';
import { DOMAIN_REGISTRY } from '@/data/domain-tracks';

const hrDomain = DOMAIN_REGISTRY['hr']!;

export default function CareerSphereSkillTreePage() {
  return <DomainSkillMap domainLabel="HR" tracks={hrDomain.tracks} backHref="/career-sphere" />;
}
