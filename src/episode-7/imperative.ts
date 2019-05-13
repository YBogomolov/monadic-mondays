interface Organization {
  title: string;
  employees: Array<{
    name: string;
    age: number;
    car?: {
      model: string;
      plateNum: string;
    };
    partner?: {
      name: string;
      age: number;
    };
    projects?: Array<{
      title: string;
      code: string;
      started?: Date;
      ended?: Date;
    }>
  }>;
}

// Say, you're changing internal project codes from lowercase to uppercase + prefix.
// How would you do this imperatively?
function changeCodes(o: Organization): Organization {
  const newOrg: Organization = {
    ...o,
    employees: o.employees.map((emp) => ({
      ...emp,
      // Note: we need to preserve absense of `projects`:
      ...(emp.projects ? {
        projects: emp.projects.map((p) => ({
          ...p,
          code: 'MY-' + p.code.toLocaleUpperCase(),
        })),
      } : {}),
    })),
  };

  return newOrg;
}

console.dir(changeCodes({
  title: 'Foo, Inc.',
  employees: [{
    name: 'Boss',
    age: 42,
    projects: [{ title: 'FooProj', code: 'foo' }],
  }],
}), { depth: null });
