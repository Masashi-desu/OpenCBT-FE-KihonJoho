// Machine-readable witness alongside Node's ordinary human-readable reporter.
export default async function* reporter(events) {
  for await (const event of events) if (['test:pass','test:fail','test:summary','test:diagnostic'].includes(event.type))
    yield JSON.stringify(event) + '\n';
}
