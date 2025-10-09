import React from 'react';
import { Card, Box, Flex } from '@chakra-ui/react';
import { useMarkdown } from '@/web/common/hooks/useMarkdown';

import dynamic from 'next/dynamic';
const Markdown = dynamic(() => import('@/components/Markdown'));
const Avatar = dynamic(() => import('@fastgpt/web/components/common/Avatar'));

const Empty = ({
  showChatProblem,
  model: { name, intro, avatar }
}: {
  showChatProblem: boolean;
  model: {
    name: string;
    intro: string;
    avatar: string;
  };
}) => {
  const { data: chatProblem } = useMarkdown({ url: '/chatProblem.md' });
  const { data: versionIntro } = useMarkdown({ url: '/versionIntro.md' });

  return (
    <Box
      minH={'20%'}
      w={'85%'}
      maxW={'600px'}
      m={'auto'}
      py={'2vh'}
      alignItems={'center'}
      justifyContent={'center'}
    >
      {name && (
        <Card p={4} mb={10}>
          <Flex mb={2} alignItems={'center'} justifyContent={'center'}>
            <Avatar src={avatar} w={'32px'} h={'32px'} />
            <Box ml={3} fontSize={'3xl'} fontWeight={'bold'}>
              {name}
            </Box>
          </Flex>
          <Box whiteSpace={'pre-line'}>{intro}</Box>
        </Card>
      )}

      {
        <>
          {/* version intro */}
          <Card p={4} mb={10}>
            <Markdown source={versionIntro} />
          </Card>
        </>
      }
    </Box>
  );
};

export default Empty;
