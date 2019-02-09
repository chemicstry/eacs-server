import commandLineArgs = require('command-line-args');
import commandLineUsage = require('command-line-usage');
import optionDefinitions from './optionDefinitions';

// Global var
export var options: commandLineArgs.CommandLineOptions;

export function initOptions() {
  options = commandLineArgs(<commandLineUsage.OptionDefinition[]>optionDefinitions);

  // Print usage
  if (options.help) {
    const sections = [
      {
        header: 'eacs-server',
        content: 'Extensible Access Control System Server'
      },
      {
        header: 'Options',
        optionList: optionDefinitions
      }
    ];

    console.log(commandLineUsage(sections));
    process.exit();
  }
}
