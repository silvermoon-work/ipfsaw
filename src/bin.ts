#!/usr/bin/env node
import { main } from "@silvermoon-work/ipfsaw/cli";
process.exitCode = await main(process.argv.slice(2));
